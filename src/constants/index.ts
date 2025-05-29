import backArrow from "assets/icons/back-arrow.png";
import email from "assets/icons/email.png";
import person from "assets/icons/person.png";
import profile from "assets/icons/profile.png";
import search from "assets/icons/search.png";
import phone from "assets/icons/phone.png";
import lock from "assets/icons/lock.png";
import getStarted from "assets/images/get-started.png";

export const images = {
  getStarted,
};

export const icons = {
  backArrow,
  email,
  person,
  profile,
  search,
  phone,
  lock,
};

export const calculateAge = (birthdayStr: string) => {
  const [year, month, day] = birthdayStr.split('-').map(Number);
  const birthDate = new Date(year, month - 1, day);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  // If birthday hasn't occurred this year, subtract 1 from age
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};
