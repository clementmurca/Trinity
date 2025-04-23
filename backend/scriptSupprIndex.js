import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

// URI de connexion MongoDB
const MONGODB_URI = process.env.MONGODB_URI;

async function dropIndex() {
    try {
        console.log(`Tentative de connexion à MongoDB: ${MONGODB_URI}`);

        // Établir la connexion
        await mongoose.connect(MONGODB_URI);
        console.log('Connecté à MongoDB');

        // Vérifier les index existants
        const indexes = await mongoose.connection.db.collection('orders').indexes();
        console.log('Index existants:', JSON.stringify(indexes, null, 2));

        // Chercher l'index sur products.code
        const targetIndex = indexes.find(idx =>
            idx.key && idx.key['products.code'] === 1
        );

        if (targetIndex) {
            console.log(`Index trouvé: ${targetIndex.name}`);

            // Supprimer l'index
            await mongoose.connection.db.collection('orders').dropIndex(targetIndex.name);
            console.log('Index supprimé avec succès');
        } else {
            console.log('Aucun index sur products.code trouvé');
        }
    } catch (error) {
        console.error('Erreur:', error);
    } finally {
        // Fermer la connexion
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
            console.log('Déconnecté de MongoDB');
        }
    }
}

// Exécuter la fonction
dropIndex();