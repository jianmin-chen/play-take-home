export default function expect(ok: boolean, message: string) {
    if (!ok) throw new Error(message);
}
