export { default } from 'next-auth/middleware';

export const config = {
  matcher: ['/dashboard'],
 };

// import withAuth from "next-auth/middleware";
// import { handler } from "./app/api/auth/[...nextauth]/route";
// import middleware from "next-auth/middleware";
// import { NextResponse } from "next/server";

// export default withAuth(
//   function middleware(req) {
//     if (req.nextUrl.pathname === "/dashboard") {
//       return new NextResponse("not auth..");
//     }
//   },
//   // jwt: { decode: handler.jwt?.decode },
//   {
//     callbacks: {
//       authorized: ({ token }) => !!token,
//     },
//   }
// );
