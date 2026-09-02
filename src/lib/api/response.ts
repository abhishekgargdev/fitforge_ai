import { NextResponse } from "next/server";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function fail(message: string, status: number, code: string) {
  return NextResponse.json({ error: { message, code } }, { status });
}
