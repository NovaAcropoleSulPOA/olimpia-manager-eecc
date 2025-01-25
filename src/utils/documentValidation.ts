export const cleanDocumentNumber = (doc: string): string => {
  return doc.replace(/\D/g, '');
};

export const validateCPF = (cpf: string): boolean => {
  console.log('Validating CPF:', cpf);
  
  // Clean the CPF string
  const cleanCPF = cleanDocumentNumber(cpf);
  
  // Check if it has 11 digits
  if (cleanCPF.length !== 11) {
    console.log('CPF length invalid');
    return false;
  }

  // Check if all digits are the same
  if (/^(\d)\1{10}$/.test(cleanCPF)) {
    console.log('CPF has all same digits');
    return false;
  }

  // First digit calculation
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let remainder = sum % 11;
  const digit1 = remainder < 2 ? 0 : 11 - remainder;

  // Second digit calculation
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  remainder = sum % 11;
  const digit2 = remainder < 2 ? 0 : 11 - remainder;

  // Check if calculated digits match the actual digits
  const valid = digit1 === parseInt(cleanCPF.charAt(9)) && 
                digit2 === parseInt(cleanCPF.charAt(10));
  
  console.log('CPF validation result:', valid);
  return valid;
};