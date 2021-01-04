package de.kettcards.web2print.repository;

import de.kettcards.web2print.model.db.AspectRatio;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AspectRatioRepository extends PagingAndSortingRepository<AspectRatio, Integer> {

}
