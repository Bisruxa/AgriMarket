export const formStepsConfig = {
  FARMER: [
    {
      title: 'Welcome',
      subtitle: 'SignUp',
      fields: [
        { id: 'fullName', label: 'Full Name', type: 'text', required: true },
        { id: 'email', label: 'Email Address', type: 'email', required: true },
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
    {
      title: '',
      subtitle: 'Tell us about your farm',
      fields: [
        { id: 'farmSize', label: 'Farm Size (acres)', type: 'number', required: true },
        { id: 'crops', label: 'Preferred Crops', type: 'text', required: false, placeholder: 'e.g., Wheat, Corn, Soybeans' },
        { id: 'experience', label: 'Farming Experience (years)', type: 'number', required: false },
      ]
    }
  ],
  TRADER: [
    {
      title: 'Welcome',
      subtitle: 'SignUp',
      fields: [
        { id: 'fullName', label: 'Full Name', type: 'text', required: true },
        { id: 'email', label: 'Email Address', type: 'email', required: true },
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