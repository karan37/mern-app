# Welcome to my submission

In this readme I will explain
- How to run this project
- Objectives for my approach
- Libraries used and why
- Design choices
- Challenges and learning

## How to run this project 

1. Please make sure you have docker installed if not already. [Install Link](https://docs.docker.com/engine/install/)
2. Clone this repository and from inside the root directory run command:
> `docker-compose up --build`
3. Once completed the app can be accessed on <https://localhost:5000/>

## Objective for my appraoch

Even though I prefer simple light-weight solutions, my goal for this submission was to showcase my skills and my ability to adapt to promising new technologies.
Also this gave me an opportunity to learn new things and enhance my knowledge.

## Libraries used and why

1. **Typescript**:  
This is quickly becoming the industry standard and not only for back-end development.
I thought it was a good opportunity to be able to set up a typescript project from scratch and how it affected my development experience.
For a project of limited complexity like this it would not have been my default choice. But I do concede I thought it was good at catching errors on compile time and I rarely
faced breaking erros on runtime during the development process. Also useful to enforce data validation.
2. **[Ant Design](https://ant.design/)**  
I am a long time fan of this UI library and have used it in many projects because of the sheer number of components and features it offers right out of the box. 
Form Validations and Pagination issues became a breeze and I was able to focus on structure and design decisions. 
Usually whenever I feel like it would be nice to have this feature turns out Antd already has it.
Also the features are super customizable and inspires one to do a lot more. The component APIs are well documented and even though there are limited examples of its use cases
I have managed to make them quite extendable at times.
3. **Tailwind CSS**  
I remember when I was first introduced to SCSS/SASS it was like a super power. Then I saw React inspired `styled-components` which was great to directly handle styling logic in JS.
When I first heard of Tailwind I was super skeptical as it sounded more like bootstrap to me but it has really surprised me. 
I am still not used to the syntax completely but its extremely intuitive and the search functionality on their docs page is super impressive.
More over it's selectors and group function make anything feel posible as with SCSS and it has the added benefit of being CSS-in-JS based so conditional styling is super quick.
Only downside to tailwind I find is having long class strings in the React components looks a bit messy but 
I thought of a solution to this, by having a function library for returning class strings.
4. **Mongoose**  
Again for simple projects like this I would have likely just used the native Mongo drivers 
but since you are a mongo based org, no ORMs so far have functionality built to service Mongo like mongoose. 
I read that Prisma support for mongo is not great and was skeptical to try it just yet.
5. **GraphQL**  
Also a bit of an overkill to use here. But since you mentioned being part of your stack I wanted to showcase that I am comfortable with Graphql APIs. 
I see a lot of value in using GraphQL services for complex frontends which allows the ability to fetch selective data (only what's required). 
Very useful in rapid prototyping of frequently expanding frontend features.
6. **Axios**  
It's my go to for working with REST APIs. Has good functionality to introduce middlewares. I am just as good to use fetch API from React.

**Notable Omissions**  
- **NextJS:** I have been working with NextJS as it offers many page optimatization solutions by default. Also that it can handle a complete full stack application. 
However I chose against it for this project because it has fundamental differences on structure, routing and even component composition. 
I figured it may not be relevant for this position at this time.
- **Redux:** I do feel like Redux is necessary only for applications with highly distributed states. 
A lot of modularization and abstraction can be accomplished with React Hooks and Contexts alone which are concepts upon which Redux is built anyway. 
Please take note of the `useAuth` custom hook I wrote for this project to modularize auth functionality to be used across components.

## Design Choices

### Backend  

Like I mentioned earlier to exhibit my flexibility I ended up using both REST (for auth) as well as GraphQL (for data fetching).  
  
**Redis Cache:** The jobicy API dcoumentation mentioned that over fetching from the API would be an issue. The data was not updating frequently anyway, so I decided to implement a Redis Cache.
Basically upon server initialization the backend would make a request for the jobs data and store it in a local cache which updates every 24hrs. 
Every request from the frontend would be served from the cache data unless the cache is unavailable. This is only when it would make another query to jobicy API on-demand.  

Authentication is managed using JWT token. User is issued a token for 1h after a successful login.

Since the requirements involved authorization based on role types. The role data is encoded in the authorization token created by the server and used by the client.
The server has a middleware which parses the role data to graphQL resolver so that it only sends relevant data to the client request. 

### Frontend

Wrote a `useAuth` custom hook to manage authentication/authorization functions.  

Added a catch-all route to handle unimplemented URLs. It provides links to navigate back to the application.

Created a Protected Wrapper Component to wrap around pages intended only for authorized users. This can be used to easily manage secure pages as well as role based pages.
It can re-direct users accordingly.

Added a logout button on Listings Page

## Challenges and learning

I initailly had an implementation for register route to return the token and log user in directly after registration. This was the inspiration for the useAuth hook, 
as it was being used in all 3 components. However I changed the implementation because the requirements specifically asked for user to be re-directed to the Login Page.  

I was developing on a windows machine and realized that Redis isn't easily available on windows. So docker containerization became a necessity rather than an option.
I have also included the .env file in the repo for faster set-up. (I know this is not recommended for security)

For easier set-up I ended up using a local implementation for Mongo because otherwise it would have added to additional steps for set-up as well as needing to update the white-list manually with your IP address 

I found some issues relating to jest testing with Typescript. Will need to look at an alternative library with better typescript support. Vitest seems promising.

I was having trouble getting env variables to pass to the frontend. Finally realized that create-react-app has a restriction on env variables being prefixed with REACT_APP_
