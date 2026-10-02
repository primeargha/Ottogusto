import MySavedCar from "@/screens/garage-bay/MySavedCar";

export async function generateStaticParams() {
  return [
    {
      cardId: "m8fi5uxpm49ko0",
    },
    {
      cardId: "m8fiiqb0kmvfi5",
    },
    {
      cardId: "m8ff6ljy6a4hbf",
    },
    {
      cardId: "m8ffkci025ocbq",
    },
  ];
}

type CarDetailPageProps = {
  params: {
    cardId: string;
  };
};

export default function CarDetailPage({ params }: CarDetailPageProps) {
  return <MySavedCar cardId={params.cardId} />;
}
