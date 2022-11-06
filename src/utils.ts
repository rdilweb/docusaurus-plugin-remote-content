import picocolors from "picocolors"
import milli from "pretty-ms"

export async function timeIt(
    name: string,
    action: () => Promise<void>
): Promise<void> {
    const startTime = new Date()
    await action()
    console.log(
        `${picocolors.green(`Task ${name} done (took `)} ${picocolors.white(
            milli((new Date() as any) - (startTime as any))
        )}${picocolors.green(`)`)}`
    )
}
