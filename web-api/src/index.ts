import * as Realm from 'realm-web';
import * as utils from './utils';

interface Bindings {
    REALM_APPID: string;
    MARECHARGE_API: string;
}

type Document = globalThis.Realm.Services.MongoDB.Document;

interface Bornes extends Document {
    done: boolean;
    bornes: string;
}

let App: Realm.App;
const ObjectId = Realm.BSON.ObjectID;

const worker: ExportedHandler<Bindings> = {
    async fetch(req, env) {
        const url = new URL(req.url);
        App = App || new Realm.App(env.REALM_APPID);

        const method = req.method;
        const path = url.pathname.replace(/[/]$/, '');
        const villeParam = url.searchParams.get('ville') || '';

        if (path !== '/v1/app') {
            return utils.toError(`Vous n\'êtes pas autorisé(e) à appeller l\'API de Ma Recharge depuis cette url...`, 404);
        }

        const token = env.MARECHARGE_API;
        if (!token) return utils.toError('Vous n\'êtes pas autorisé(e) à appeller l\'API de Ma Recharge.', 401);

        try {
            const credentials = Realm.Credentials.apiKey(token);
            var user = await App.logIn(credentials);
            var client = user.mongoClient('mongodb-atlas');
        } catch (err) {
            return utils.toError('Impossible de se connecter...', 500);
        }

        const collection = client.db('ma-recharge').collection<Bornes>('bornes');

        try {
            if (method == 'GET') {
                if(villeParam) {
                    //villeParam = villeParam.toLowerCase();
                    //villeParam = villeParam.replace(" ","_");
                    //villeParam = villeParam.replace("saint","st");
                    const dataDBMaRecharge = await collection.find({"ville": villeParam.toLowerCase()});
                    if(dataDBMaRecharge == "") {
                        return utils.toError('Ville non trouvée...', 404);
                    }
                    const bornes_info = dataDBMaRecharge[0]["info"];
                    return utils.reply(
                        bornes_info
                    );
                }
            }

            return utils.toError('Method not allowed.', 405);
        } catch (err) {
            const msg = (err as Error).message || 'Error with query.';
            return utils.toError(msg, 500);
        }
    }
}

export default worker;
