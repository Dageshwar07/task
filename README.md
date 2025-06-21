# Node.js MySQL OpenFGA CRUD API

This is a Node.js backend application that implements CRUD operations with MySQL connection and authorization using OpenFGA.


##fga model for this app thats manage all credetials

model
model
  schema 1.1

type user

type group
  relations
    define member: [user]

type resource
  relations
    define can_change_owner: owner
    define can_delete: owner
    define can_read: viewer or editor or owner
    define can_write: editor or owner
    define editor: [user, group#member]
    define owner: [user]
    define viewer: [user, group#member]


## Features

- User authentication (register, login, update profile)
- Resource management (create, read, update, delete)
- Fine-grained authorization using OpenFGA
- RESTful API design

## Prerequisites

- Node.js (v14 or higher)
- MySQL database
- OpenFGA account and store setup

## Setup

1. **Clone the repository**



2. **Install dependencies**



3. **Setup environment variables**

Create a `.env` file based on the provided `.env.example` file:
Update the values in the `.env` file according to your setup.

4. **Set up the MySQL database**

Create the required database and tables:
