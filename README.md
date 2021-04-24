# Affirmation-Mart Backend

This repository is for the backend of Affirmation-Mart, an ecommerce site with an uplifting twist. At Affirmation-Mart, users get 50 credits per order that they can use to order affirmations. 

### Link for AWS deployment

Link for AWS deployment
[https://www.affirmationmart.com/](https://www.affirmationmart.com/)

### Getting Started

In the current version of the project, all users can view the available affirmations, those both in stock and out of stock. If a user would like to order an affirmation, they can sign in or sign up. Users can add and remove affirmations from their cart, and they can go through a checkout flow to place an order.

## Technologies Used

- DynamoDB, React, Serverless Framework, AWS Lambda
- Redux Toolkit for state management
- Material-UI
- Bcrypt for password security
- Postman
- AWS S3, Route 53, and Cloudfront

## Preplanning

The first step of my preplanning was to outline the goals of this project. I was interested in creating an ecommerce platform, but I wasn't sure about handling actual monetary payments. As a way to still work through the UI and logic of order processing without taking card information, I decided to go with an automatic credit system, wrapping it in the idea that nobody should have to pay for affirmations. 

In this project, I chose to use a single-table design paradigm for the DynamoDB table. This means that all users, orders both in process and fulfilled, and items are saved in one table instead of in three or more separate tables. 

## Version 2

For version two I would like to add validation that disables the "add to cart" button once an item is placed in a cart, implement AWS SQS to deliver orders to users' email addresses, and add a UI feature that dynamically displays the number of items in the cart at any given time. 
