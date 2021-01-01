package de.kettcards.web2print.repository;

import de.kettcards.web2print.model.db.Card;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CardRepository extends PagingAndSortingRepository<Card, Integer> {

    Card findCardByOrderId(String orderId);

    <T> List<T> findAllProjectedBy(Class<T> type);

    <T> Page<T> findAllProjectedBy(Pageable pageable, Class<T> type);

}
