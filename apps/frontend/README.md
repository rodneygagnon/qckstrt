This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Make Commands

To __build__ images
```bash
make build
```

To __push__ images
```bash
make push
```

## Docker Commands

To create and run a Docker image, run

```bash
docker compose --env-file .env.docker.dev build
docker compose --env-file .env.docker.dev up
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Once you have created and loaded a certificate to the Nginx image/container, you can also access via SSL

Open [http://localhost](http://localhost) with your browser to see the result.

or

Open [https://localhost](https://localhost) with your browser to see the result.
