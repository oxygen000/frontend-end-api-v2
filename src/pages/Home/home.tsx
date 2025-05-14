import { useState } from 'react';
import { motion } from 'framer-motion';
import PopupChoiceAdd from '../../components/PopupChoice/PopupChoiceAdd';
import PopupChoiceIdentification from '../../components/PopupChoice/PopupChoiceIdentification';
import PopupChoiceSearch from '../../components/PopupChoice/PopupChoiceSearch';
import { useTranslationWithFallback } from '../../hooks/useTranslationWithFallback';

function Home() {
  const { t } = useTranslationWithFallback();
  const [isPopupAddOpen, setIsPopupAddOpen] = useState(false);
  const [isPopupSearchOpen, setIsPopupSearchOpen] = useState(false);
  const [isPopupIdentificationOpen, setIsPopupIdentificationOpen] =
    useState(false);

  const openPopup = () => setIsPopupAddOpen(true);
  const closePopup = () => setIsPopupAddOpen(false);
  const openPopupSearch = () => setIsPopupSearchOpen(true);
  const closePopupSearch = () => setIsPopupSearchOpen(false);
  const openPopupIdentification = () => setIsPopupIdentificationOpen(true);
  const closePopupIdentification = () => setIsPopupIdentificationOpen(false);

  const buttonVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    hover: { scale: 1.05, transition: { duration: 0.2 } },
  };

  const titleVariants = {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        className="text-center mb-8"
        initial="initial"
        animate="animate"
        variants={titleVariants}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold text-white">
          {t('home.title', 'SMART FACE ID POLICE EDITION')}
        </h1>
      </motion.div>

      <div className="relative flex flex-col items-center gap-8 sm:grid sm:grid-cols-7 sm:grid-rows-7 sm:gap-4 sm:items-stretch">
        {/* Button 1 */}
        <motion.div
          className="flex flex-col items-center sm:col-start-2 sm:col-end-3 sm:row-start-1 sm:row-end-5"
          initial="initial"
          animate="animate"
          variants={buttonVariants}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="bg-white w-16 h-16 flex justify-center items-center rounded-full border-2 border-gray-800 z-10 mb-2">
            <span className="text-2xl text-gray-800">1</span>
          </div>
          <motion.button
            onClick={openPopupIdentification}
            className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition duration-300"
            whileHover="hover"
            variants={buttonVariants}
          >
            {t('home.identificationButton', 'Identification Of Unidentified')}
          </motion.button>
        </motion.div>

        {/* Button 2 */}
        <motion.div
          className="flex flex-col items-center sm:col-start-4 sm:col-end-5 sm:row-start-1 sm:row-end-5"
          initial="initial"
          animate="animate"
          variants={buttonVariants}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="bg-white w-16 h-16 flex justify-center items-center rounded-full border-2 border-gray-800 z-10 mb-2">
            <span className="text-2xl text-gray-800">2</span>
          </div>
          <motion.button
            onClick={openPopupSearch}
            className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition duration-300"
            whileHover="hover"
            variants={buttonVariants}
          >
            {t('home.searchButton', 'Search For Missing Persons')}
          </motion.button>
        </motion.div>

        {/* Button 3 */}
        <motion.div
          className="flex flex-col items-center sm:col-start-6 sm:col-end-7 sm:row-start-1 sm:row-end-5"
          initial="initial"
          animate="animate"
          variants={buttonVariants}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="bg-white w-16 h-16 flex justify-center items-center rounded-full border-2 border-gray-800 z-10 mb-2">
            <span className="text-2xl text-gray-800">3</span>
          </div>
          <motion.button
            onClick={openPopup}
            className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition duration-300"
            whileHover="hover"
            variants={buttonVariants}
          >
            {t('home.addButton', 'Add New Data')}
          </motion.button>
        </motion.div>

        <motion.div
          className="hidden sm:block absolute bg-white h-1 top-[10%] left-[21%] w-[28%]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        ></motion.div>
        <motion.div
          className="hidden sm:block absolute bg-white h-1 top-[10%] left-[52%] w-[28%]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        ></motion.div>
      </div>

      {/* Popups */}
      <PopupChoiceAdd
        isOpen={isPopupAddOpen}
        onClose={closePopup}
        title={t('popups.addTitle', 'Select the type of data to add')}
        cancelText={t('common.cancel', 'cancel')}
      />

      <PopupChoiceIdentification
        isOpen={isPopupIdentificationOpen}
        onClose={closePopupIdentification}
        title={t(
          'popups.identificationTitle',
          'Select the type you want to check.'
        )}
        cancelText={t('common.cancel', 'cancel')}
      />

      <PopupChoiceSearch
        isOpen={isPopupSearchOpen}
        onClose={closePopupSearch}
        title={t('popups.searchTitle', 'Select the type you want to check.')}
        cancelText={t('common.cancel', 'cancel')}
      />
    </div>
  );
}

export default Home;
