package de.kettcards.web2print.repository;

import de.kettcards.web2print.model.db.Fold;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FoldRepository extends JpaRepository<Fold, Integer> {

}
