package de.kettcards.web2print.repository;

import de.kettcards.web2print.model.db.Card;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CardRepository extends JpaRepository<Card, Integer> {

    Optional<Card> findCardByOrderId(String orderId);

    <T> List<T> findAllProjectedBy(Class<T> type);

    <T> Page<T> findAllProjectedBy(Pageable pageable, Class<T> type);

}
