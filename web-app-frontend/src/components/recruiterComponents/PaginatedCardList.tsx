import { useState } from "react";

interface PropsType {
  allCards: string[];
}

const PaginatedCardList = ({ allCards }: PropsType) => {
  const [currentPage, setCurrentPage] = useState(1);
  const cardsPerPage = 3;
  const totalPages = Math.ceil(allCards.length / cardsPerPage);

  const currentCards = allCards.slice(
    (currentPage - 1) * cardsPerPage,
    currentPage * cardsPerPage,
  );

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const previousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div>
      <div className="card-list">
        {currentCards.map((card, index) => (
          <div key={index} className="card">
            card {card}
          </div>
        ))}
      </div>

      <div className="pagination-controls">
        <button onClick={previousPage} disabled={currentPage === 1}>
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button onClick={nextPage} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>
    </div>
  );
};

export default PaginatedCardList;
