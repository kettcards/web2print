package de.kettcards.web2print.repository;

import de.kettcards.web2print.model.db.Texture;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TextureRepository extends JpaRepository<Texture, Integer> {

    Texture findMaterialById(Integer id);

    Texture findMaterialByName(String name);

    List<Texture> findAll();
}
