package de.kettcards.web2print.repository;

import de.kettcards.web2print.model.db.Motive;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MotiveRepository extends JpaRepository<Motive, Integer> {

    List<Motive> findAllById(Integer name);

    boolean existsMotiveByTextureSlug(String textureSlug);

    Motive findByTextureSlug(String textureSlug);

}
