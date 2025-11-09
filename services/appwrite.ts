import { Client, Query, TablesDB } from "react-native-appwrite";

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const TABLE_ID = process.env.EXPO_PUBLIC_APPWRITE_TABLE_ID!;

const client = new Client().setEndpoint("https://syd.cloud.appwrite.io/v1").setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!);

const tablesDB = new TablesDB(client);

export const updateSearchCount = async (query: string, movie: Movie) => {
	// const result = await database.listDocuments(DATABASE_ID, TABLE_ID, [Query.equal("searchTerm", query)]);
	try {
		const result = await tablesDB.listRows(DATABASE_ID, TABLE_ID, [Query.equal("searchTerm", query)]);
		console.log(result);
	} catch (error) {
		console.log(error);
	}

	// check if a record of that search is already been stored
	// if a document is found increment the searchCount field
	// if no document is found then
	// create a new document in Appwrite database -> 1
};
