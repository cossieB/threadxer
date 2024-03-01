# [Threadxer (W.I.P)](https://threadxer.cossie.dev)

Threadxer is a all-new social media platform where you can post your thoughts (in under 180 characters, of course). This platform features groundbreaking features like: creating an account using email; uploading images and video; likeing, reposting and quoting other posts; following your favorite content creators so that their posts are shown in your "feed".

## Stack

Threadxer is built with the latest and greatest libraries to ensure high developer velocity and high performance. tRPC is used to make API calls and to ensure end-to-end type safety. Fastify is a high performance server for Node.js. Drizzle ORM is a SQL builder for TypeScript that provides the excellent developer experience of an ORM and the efficient queries of raw SQL. Tanstack Query (f.k.a React Query) and Redis are used for caching on the client and server respectively, providing cost savings and good user experience. Solid.js is a frontend library for creating performant user interfaces.

Threadxer has a custom built authentication system using JWTs. Refresh and short-term access tokens are used to ensure high security. Passwords are hashed with Bcrypt.

### Backend

- [TypeScript](https://www.typescriptlang.org/)
- [Node.js](https://nodejs.org/en)
- [PostgreSQL](https://www.postgresql.org/)
- [Redis](https://redis.io/) via [IO Redis library](https://github.com/redis/ioredis)
- [Fastify](https://fastify.dev/)
- [tRPC](https://trpc.io/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [JSON web token](https://jwt.io)
- [Nodemailer](https://nodemailer.com/)
- Deployment to [Railway.app](https://railway.app/)
- [Docker](https://www.docker.com/)
- [Bcrypt](https://www.npmjs.com/package/bcrypt)

### Frontend

- [TypeScript](https://www.typescriptlang.org/)
- [Solid.js](https://www.solidjs.com/)
- [Firebase Storage](https://firebase.google.com/)
- [Tanstack Solid Query](https://tanstack.com/query/latest)
- [SASS](https://sass-lang.com/)

## Cloning

Feel free to clone this repo if you wish. Note, however, that the project won't work proper environment variables and a firebase service JSON file. See /server/.env.example