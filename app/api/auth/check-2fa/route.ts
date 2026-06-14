export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/auth/check-2fa?username=X
// Returns whether a username has TOTP enabled.
// No auth required — used by the login page to conditionally show the TOTP field.
//
// SEC-030 (aceito por design): este endpoint revela se um usuário tem 2FA ativo
// antes da verificação de senha. É inerente à feature (o campo TOTP precisa ser
// renderizado antes do submit). O vazamento é de baixo valor — exige conhecer o
// username e a senha continua obrigatória — e o escopo é interno. Usuários
// inexistentes e usuários sem 2FA retornam o mesmo `false`, então só é possível
// saber quais usernames já conhecidos têm 2FA, não descobrir usernames válidos.
export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get("username");
  if (!username) {
    return NextResponse.json({ totpEnabled: false });
  }

  const user = await db.user.findUnique({
    where: { username },
    select: { totpEnabled: true },
  });

  return NextResponse.json({ totpEnabled: user?.totpEnabled ?? false });
}
