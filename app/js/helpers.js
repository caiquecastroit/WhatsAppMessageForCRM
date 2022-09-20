const errorStruct = (functionName, message, data, log) => {

    if (typeof functionName !== "string" || !functionName) {
        console.log(`'#functionName' informado incorretamente. - typeof ${typeof functionName}`)
        return { error: typeof message === 'string' ? message : "message informado incorretamente.", data, func: "functionName informado incorretamente." }
    }

    if (typeof message !== "string" || !message) {
        console.log(`'#message' informado incorretamente. ${typeof message}`)
        return { error: "'#message' informado incorretamente.", data, func: functionName }
    }

    log && console.log(`##${functionName} - Error: ${message} - Data: ${data}`)

    return { error: message, data, func: functionName }

}

const parser = (str) => {

    if (typeof str != "string") return str

    try {

        str = JSON.parse(str)

        Object.keys(str).forEach((e) => {

            try {

                if (typeof str?.[e] == 'string') {
                    const parsed = JSON.parse(str?.[e])
                    str[e] = parsed
                    return
                }

            } catch (err) {
                const verifyError = err
                return
            }

        })

    } catch (err) {
        return errorStruct("parse", "Erro ao parsear o JSON.", str, true)
    }

    return str

}