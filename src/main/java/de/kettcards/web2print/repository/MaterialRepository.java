package de.kettcards.web2print.repository;

import de.kettcards.web2print.model.db.Material;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaterialRepository extends PagingAndSortingRepository<Material, Integer> {

    Material findMaterialById(Integer id);

    List<Material> findAll();
}
