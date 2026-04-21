import * as yup from 'yup';

export const loginSchema = yup.object({
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup.string().min(6, 'Minimum 6 characters').required('Password is required'),
});

export const signupSchema = yup.object({
  name: yup.string().min(2, 'Minimum 2 characters').required('Name is required'),
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup.string().min(6, 'Minimum 6 characters').required('Password is required'),
  enrollmentNo: yup.string().trim().required('Enrollment number is required'),
  department: yup.string().trim().required('Department is required'),
  gender: yup.string().oneOf(['male', 'female'], 'Select male or female').required('Gender is required'),
  fatherName: yup.string().trim().required('Father name is required'),
  fatherPhone: yup.string().trim().required('Father phone number is required'),
  motherName: yup.string().trim().required('Mother name is required'),
  motherPhone: yup.string().trim().required('Mother phone number is required'),
});

export const adminSignupSchema = yup.object({
  name: yup.string().min(2, 'Minimum 2 characters').required('Name is required'),
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup.string().min(6, 'Minimum 6 characters').required('Password is required'),
});

export const complaintSchema = yup.object({
  title: yup.string().required('Title is required'),
  description: yup.string().required('Description is required'),
  studentName: yup.string().required('Student name is required'),
  hostelBuilding: yup.string().required('Hostel building is required'),
  roomNo: yup.string().required('Room number is required'),
});

export const expenseSchema = yup.object({
  item: yup.string().required('Item name is required'),
  amount: yup.number().typeError('Amount must be a number').positive('Amount must be positive').required('Amount is required'),
});

export const logSchema = yup.object({
  type: yup.string().oneOf(['in', 'out'], 'Type must be in or out').required('Type is required'),
  note: yup.string().required('Note is required'),
});
