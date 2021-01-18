package de.kettcards.web2print.repository;

import de.kettcards.web2print.model.db.rel.MotiveMap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MotiveMapRepository extends JpaRepository<MotiveMap, MotiveMap.MotiveMapId> {
}
