import NextAuth from "next-auth";

/**
 * 카카오 로그인은 2차 개발로 미룸.
 * KAKAO_CLIENT_ID / KAKAO_CLIENT_SECRET 등록 후 Kakao provider를 추가한다.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  trustHost: true,
});
