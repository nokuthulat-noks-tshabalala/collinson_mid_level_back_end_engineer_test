import express, { Application } from 'express';
import { ApolloServer } from 'apollo-server-express';
import { makeExecutableSchema } from '@graphql-tools/schema';
import cors from 'cors';
import helmet from 'helmet';
import { typeDefs } from './schema/typeDefs';
import { resolvers } from './resolvers';

async function startServer(): Promise<{ app: Application; server: ApolloServer }> {
  const app = express();
  const port = process.env.PORT || 4000;

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    } : false, // Disable CSP in development for GraphQL Playground
    crossOriginEmbedderPolicy: false
  }));

  // CORS configuration
  app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.ALLOWED_ORIGINS?.split(',') || []
      : true,
    credentials: true
  }));

  // Create GraphQL schema
  const schema = makeExecutableSchema({
    typeDefs,
    resolvers
  });

  // Create Apollo Server
  const server = new ApolloServer({
    schema,
    context: ({ req }) => ({
      // Add any context data here
      headers: req.headers
    }),
    introspection: process.env.NODE_ENV !== 'production'
  });

  await server.start();
  server.applyMiddleware({ 
    app: app as any, 
    path: '/graphql',
    cors: false // We're handling CORS above
  });

  // Enable static file serving for documentation
  app.use('/static', express.static('public'));

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // API Documentation endpoint
  app.get('/docs', (req, res) => {
    res.sendFile('docs.html', { root: 'public' });
  });

  // GraphQL Playground endpoint - redirect to Apollo Studio Sandbox
  app.get('/playground', (req, res) => {
    const sandboxUrl = `https://studio.apollographql.com/sandbox/explorer?endpoint=${encodeURIComponent(`http://localhost:${port}/graphql`)}`;
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>GraphQL Playground</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
          .container { max-width: 600px; margin: 0 auto; }
          .button { display: inline-block; padding: 12px 24px; background: #1976d2; color: white; text-decoration: none; border-radius: 4px; margin: 10px; }
          .button:hover { background: #1565c0; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>GraphQL API Interface</h1>
          <p>Choose how you'd like to interact with the GraphQL API:</p>
          <a href="${sandboxUrl}" class="button" target="_blank">Open Apollo Studio Sandbox</a>
          <a href="/docs" class="button">View API Documentation</a>
          <h3>Direct GraphQL Endpoint</h3>
          <p>POST requests to: <code>http://localhost:${port}/graphql</code></p>
          <h3>Sample Query</h3>
          <pre style="background: #f5f5f5; padding: 15px; border-radius: 4px; text-align: left;">
query {
  searchCities(query: "London") {
    id
    name
    country
    latitude
    longitude
  }
}</pre>
        </div>
      </body>
      </html>
    `);
  });

  // Root endpoint with API information
  app.get('/', (req, res) => {
    res.json({
      name: 'Travel Planning GraphQL API',
      version: '1.0.0',
      description: 'A comprehensive GraphQL API for travel planning with weather data and activity recommendations',
      endpoints: {
        graphql: `http://localhost:${port}/graphql`,
        playground: `http://localhost:${port}/playground`,
        health: `http://localhost:${port}/health`,
        documentation: `http://localhost:${port}/docs`
      },
      schema: {
        queries: ['searchCities', 'getWeather', 'getActivityRecommendations'],
        features: ['Real-time weather data', 'Activity recommendations', 'City search', '7-day forecasts']
      }
    });
  });

  // Start the server
  app.listen(port, () => {
    console.log(`🚀 Server ready at http://localhost:${port}${server.graphqlPath}`);
    console.log(`📊 Health check available at http://localhost:${port}/health`);
  });

  return { app, server };
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start the server
if (require.main === module) {
  startServer().catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
}

export { startServer };
