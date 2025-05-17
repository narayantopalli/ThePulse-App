import backArrow from "assets/icons/back-arrow.png";
import email from "assets/icons/email.png";
import person from "assets/icons/person.png";
import profile from "assets/icons/profile.png";
import search from "assets/icons/search.png";
import phone from "assets/icons/phone.png";
import lock from "assets/icons/lock.png";
import gpt from "assets/icons/gpt.png";
import getStarted from "assets/images/get-started.png";
import onboarding1 from "assets/images/onboarding1.png";
import onboarding2 from "assets/images/onboarding2.png";
import onboarding3 from "assets/images/onboarding3.png";

export const images = {
  onboarding1,
  onboarding2,
  onboarding3,
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
  gpt,
};

export const onboarding = [
  {
    id: 1,
    title: "Feel the campus vibe",
    description:
      "See what people are up to and thinking about. Figure out the current hotspots on campus.",
    image: images.onboarding1,
    className: "mt-16 h-[400px]",
  },
  {
    id: 2,
    title: "Meet new friends",
    description:
      "Find your people outside of the classroom.",
    image: images.onboarding2,
    className: "mt-16 h-[400px]",
  },
  {
    id: 3,
    title: "Stay safe",
    description:
      "State of the art privacy features to keep your information safe while still allowing you to engage in the community fun.",
    image: images.onboarding3,
    className: "mt-16 h-[400px]",
  },
];

export const data = {
  onboarding,
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
