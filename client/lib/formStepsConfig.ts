export const formStepsConfig = {
  FARMER: [
    {
      title: 'Welcome',
      subtitle: 'SignUp',
      fields: [
        { id: 'fullName', label: 'Full Name', type: 'text', required: true },
        { id: 'email', label: 'Email Address', type: 'email', required: true },
         { id: 'phone', label: 'Phone Number', type: 'tel', required: true },
        { id: 'password', label: 'Password', type: 'password', required: true, placeholder: 'Create a password (min. 6 characters)' },
        { id: 'confirmPassword', label: 'Confirm Password', type: 'password', required: true },
      ]
    },
    {
      title: '',
      subtitle: "Tell us where you're located",
      fields: [
        { id: 'region', label: 'Region', type: 'text', required: true },
        { id: 'woreda', label: 'Woreda', type: 'text', required: true },
      ]
    },
  ],
  TRADER: [
    {
      title: 'Welcome',
      subtitle: 'SignUp',
      fields: [
        { id: 'fullName', label: 'Full Name', type: 'text', required: true },
        { id: 'email', label: 'Email Address', type: 'email', required: true },
          { id: 'phone', label: 'Phone Number', type: 'tel', required: true },
        { id: 'password', label: 'Password', type: 'password', required: true, placeholder: 'Create a password (min. 6 characters)' },
        { id: 'confirmPassword', label: 'Confirm Password', type: 'password', required: true },
       
      ]
    },
    {
      title: '',
      subtitle: "Tell us where you're located",
      fields: [
        { id: 'region', label: 'Region', type: 'text', required: true },
        { id: 'woreda', label: 'Woreda', type: 'text', required: true },
      ]
    }
  ]
};