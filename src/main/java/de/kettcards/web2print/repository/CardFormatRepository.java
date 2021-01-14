package de.kettcards.web2print.repository;

import de.kettcards.web2print.model.db.CardFormat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CardFormatRepository extends JpaRepository<CardFormat, Integer> {

    Optional<CardFormat> findById(Integer id);

    List<CardFormat> findAll();

}
