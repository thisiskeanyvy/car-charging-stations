export function toJSON(data: unknown, status = 200): Response {
    let body = JSON.stringify(data, null, 2);
    let headers = {
        'Access-Control-Allow-Origin': '*', // Allow requests from any origin
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', // Allow specified HTTP methods
        'Access-Control-Allow-Headers': 'Content-Type', // Allow specific headers
        'Access-Control-Max-Age': '86400',
        'content-type': 'application/json'
    };
    return new Response(body, {headers, status});
}

export function toError(error: string | unknown, status = 400): Response {
    return toJSON({error}, status);
}

export function reply(output: any): Response {
    if (output != null) return toJSON(output, 200);
    return toError('Error with query', 500);
}