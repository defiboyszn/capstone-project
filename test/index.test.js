const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');
const app = require('./app'); // assuming your app.js is in the same directory


describe('Signup route', () => {
    it('should create a new user with valid data', async () => {
      const validData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'strongpassword',
      };
  
      const response = await request(app).post('/signup').send(validData);
  
      expect(response.status).to.equal(200);
      expect(response.body.message).to.equal('Successfully Signed Up');
      expect(response.body.data).to.have.property('username');
      expect(response.body.data).to.have.property('email');
      expect(response.body.data).to.not.have.property('password');
    });
  
    it('should return an error for invalid email', async () => {
      const invalidData = {
        username: 'testuser',
        email: 'invalid_email',
        password: 'strongpassword',
      };
  
      const response = await request(app).post('/signup').send(invalidData);
  
      expect(response.status).to.equal(400);
      expect(response.body.errors[0].msg).to.contain('must be a valid email');
    });
  });
  

  describe('Login route', () => {
    it('should login a user with valid credentials', async () => {
      const user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashed_password',
      });
  
      const loginData = {
        username: 'testuser',
        password: 'hashed_password',
      };
  
      const response = await request(app).post('/login').send(loginData);
  
      expect(response.status).to.equal(200);
      expect(response.body.message).to.equal('Successfully logged in');
      expect(response.body.data).to.have.property('token');
    });
  
    it('should return an error for invalid credentials', async () => {
      const invalidData = {
        username: 'invalid_username',
        password: 'wrong_password',
      };
  
      const response = await request(app).post('/login').send(invalidData);
  
      expect(response.status).to.equal(401);
      expect(response.body.message).to.equal('Invalid credentials');
    });
  });
  