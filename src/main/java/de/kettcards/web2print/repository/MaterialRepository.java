package de.kettcards.web2print.repository;

import de.kettcards.web2print.model.db.Material;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaterialRepository extends JpaRepository<Material, Integer> {

    Material findMaterialById(Integer id);

    Material findMaterialByName(String name);

    List<Material> findAll();
}
