FROM node:22-alpine AS deps
WORKDIR /app
RUN corepack enable
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn
RUN yarn install --immutable

FROM deps AS build
COPY . .
# Single package, not a Yarn workspace. Keep the install from the deps stage.
RUN yarn prisma:generate && yarn build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
# Patch OS packages (e.g. OpenSSL) and remove unused package managers that ship vulnerable deps.
RUN apk upgrade --no-cache \
  && rm -rf /usr/local/lib/node_modules/npm \
            /usr/local/lib/node_modules/corepack \
            /opt/yarn* \
            /usr/local/bin/npm \
            /usr/local/bin/npx \
            /usr/local/bin/corepack \
            /usr/local/bin/yarn \
            /usr/local/bin/yarnpkg
COPY --from=build /app/package.json /app/yarn.lock /app/.yarnrc.yml ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
EXPOSE 3001
CMD ["node", "dist/main.js"]
