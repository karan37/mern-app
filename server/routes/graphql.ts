import {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLList,
  GraphQLString,
} from 'graphql';
import { getJobListings } from '../controllers/jobsCacheController';
import { Job } from '../controllers/jobsCacheController';

interface User {
  role: 'Paid User' | 'Free User';
}

export interface Context {
  user?: User;
}

const JobType = new GraphQLObjectType({
  name: 'Job',
  fields: {
    id: { type: GraphQLString },
    jobTitle: { type: GraphQLString },
    companyName: { type: GraphQLString },
    jobType: { type: new GraphQLList(GraphQLString) },
    jobLevel: { type: GraphQLString },
    jobGeo: { type: GraphQLString },
    jobIndustry: { type: new GraphQLList(GraphQLString) },
    salaryCurrency: { type: GraphQLString },
  },
});

export const jobListingResolver = async (
  _parent: any,
  _args: any,
  context: Context,
) => {
  const jobListings: Job[] = await getJobListings();
  if (context?.user?.role === 'Paid User') {
    return jobListings;
  } else {
    return jobListings.map(({ jobTitle, companyName, jobType, jobLevel }) => ({
      jobTitle,
      companyName,
      jobType,
      jobLevel,
    }));
  }
};

// Define the Query type
const QueryType = new GraphQLObjectType({
  name: 'Query',
  fields: {
    jobListings: {
      type: new GraphQLList(JobType),
      resolve: jobListingResolver,
    },
  },
});

const schema = new GraphQLSchema({
  query: QueryType,
});

export default schema;
