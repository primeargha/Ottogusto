interface Reviews_LABELS_Interface {
  [key: string]: string;
}

// Constant for total number of reviews
export const TOTAL_REVIEWS = 5;

export const Reviews_LABELS: Reviews_LABELS_Interface = {
  // Main section labels
  reviews_main_title_new: "Testimonials That Speak for Themselves.",
  reviews_main_subtitle_new: "See what others have to say about us!",

  // Dynamic review content
  review_1_name: "Jasper Lee",
  review_1_designation: "Sales Manager",
  review_1_content:
    "My Audi represents my hard work and success. I want to keep it in perfect condition. I'm willing to pay a premium for genuine Audi parts. It's an investment in the car's longevity.",
  review_1_image: "https://cdn.ottogusto.group/users/profile1.png",
  review_1_rating: "5",

  review_2_name: "Alain Moreau",
  review_2_designation: "Sales Manager",
  review_2_content:
    "My Audi represents my hard work and success. I want to keep it in perfect condition. I'm willing to pay a premium for genuine Audi parts. It's an investment in the car's longevity.",
  review_2_image: "https://cdn.ottogusto.group/users/profile2.png",
  review_2_rating: "4",

  review_3_name: "Noor De Vries",
  review_3_designation: "Mechanic",
  review_3_content:
    "My Audi represents my hard work and success. I want to keep it in perfect condition. I'm willing to pay a premium for genuine Audi parts. It's an investment in the car's longevity.",
  review_3_image: "https://cdn.ottogusto.group/users/profile3.png",
  review_3_rating: "5",

  review_4_name: "Murat Yilmaz",
  review_4_designation: "Mechanic",
  review_4_content:
    "My Audi represents my hard work and success. I want to keep it in perfect condition. I'm willing to pay a premium for genuine Audi parts. It's an investment in the car's longevity.",
  review_4_image: "https://cdn.ottogusto.group/users/profile4.png",
  review_4_rating: "3",

  review_5_name: "Alex Brown",
  review_5_designation: "Mechanic",
  review_5_content:
    "My Audi represents my hard work and success. I want to keep it in perfect condition. I'm willing to pay a premium for genuine Audi parts. It's an investment in the car's longevity.",
  review_5_image: "https://cdn.ottogusto.group/users/profile1.png",
  review_5_rating: "2",
};

export interface ReviewInterface {
  id: number;
  name_key: string;
  designation_key: string;
  content_key: string;
  image_key: string;
  rating_key: string;
}

// Function to generate reviews array dynamically
export const generateReviewsData = (): ReviewInterface[] => {
  let reviews_array: ReviewInterface[] = [];

  for (let i = 1; i <= TOTAL_REVIEWS; i++) {
    let review: ReviewInterface = {
      id: i,
      name_key: `review_${i}_name`,
      designation_key: `review_${i}_designation`,
      content_key: `review_${i}_content`,
      image_key: `review_${i}_image`,
      rating_key: `review_${i}_rating`,
    };
    reviews_array.push(review);
  }

  return reviews_array;
};
