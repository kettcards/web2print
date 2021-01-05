package de.kettcards.web2print.repository;

import de.kettcards.web2print.model.db.AspectRatio;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AspectRatioRepository extends PagingAndSortingRepository<AspectRatio, Integer> {

    Optional<AspectRatio> findById(Integer id);

    List<AspectRatio> findAll();

    List<AspectRatio> saveAll(List<AspectRatio> ratios);
}
