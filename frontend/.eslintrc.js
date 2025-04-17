module.exports = {
  extends: 'next/core-web-vitals',
  rules: {
    'react-hooks/exhaustive-deps': 'warn', // Keep the default behavior for most files
  },
  overrides: [
    {
      files: ['src/components/RoomTypesGrid.tsx'],
      rules: {
        'react-hooks/exhaustive-deps': 'off', // Disable only for this file
      },
    },
  ],
}; 