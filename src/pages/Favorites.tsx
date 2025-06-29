import { useFavorites } from "@/lib/favorites";
import { Header } from "@/components/Header";
import PropertyCard from "@/components/PropertyCard";
import { useSettings } from "@/lib/SettingsProvider";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";

const Favorites = () => {
  const { favorites, isLoading } = useFavorites();
  const [localFavorites, setLocalFavorites] = useState(favorites);
  useEffect(() => {
    setLocalFavorites(favorites);
  }, [favorites]);
  const { t } = useTranslation();
  const { convertCurrency } = useSettings();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">{t('yourFavorites')}</h1>
        {isLoading ? (
          <div className="flex items-center justify-center h-48 sm:h-64">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-teal-500"></div>
          </div>
        ) : localFavorites.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-3 sm:mb-4">{t('noFavoritesYet')}</h2>
            <p className="text-gray-500 text-sm sm:text-base">
              {t('startAddingFavorites')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8">
            {localFavorites.map((property) => (
              <div key={property._id} className="min-h-[320px] flex justify-center">
                <div className="w-full max-w-sm">
                  <PropertyCard 
                    property={{
                      ...property,
                      price: convertCurrency(property.price as number)
                    }} 
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites; 