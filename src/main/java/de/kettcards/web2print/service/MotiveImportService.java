package de.kettcards.web2print.service;

import de.kettcards.web2print.model.db.Card;
import de.kettcards.web2print.model.db.Material;
import de.kettcards.web2print.model.db.Motive;
import de.kettcards.web2print.model.db.rel.MotiveMap;
import de.kettcards.web2print.model.tableimport.request.MotiveResponse;
import de.kettcards.web2print.repository.CardRepository;
import de.kettcards.web2print.repository.MotiveMapRepository;
import de.kettcards.web2print.repository.MotiveRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Slf4j
@Component
public class MotiveImportService {

    @Autowired
    private MotiveRepository motiveRepository;

    @Autowired
    private MotiveScaleService motiveScaleService;

    @Autowired
    private MotiveMapRepository motiveMapRepository;

    @Autowired
    private CardRepository cardRepository;

    private Path folder = Paths.get("motives");

    public String importMotive(FileInputStream file, String name) {
        log.info("importing " + name);
        int lastDotIndex = name.lastIndexOf(".");
        name = name.substring(0, lastDotIndex);

        //save texture locally
        Path filePath;
        try {
            //create directory
            //TODO make configurable
            Files.createDirectories(folder);

            String frontName = name + "-front" + ".png";
            String backName = name + "-back" + ".png";
            Path filePathFront = folder.resolve(frontName);
            Path filePathBack = folder.resolve(backName);
            motiveScaleService.saveAndScaleImage(file, filePathFront, filePathBack);


            if (Files.exists(filePathFront)) {
                Motive frontMotive = new Motive();
                frontMotive.setTextureSlug(frontName);


                Motive motive;
                if (motiveRepository.existsMotiveByTextureSlug(frontName)) {
                    motive = motiveRepository.findByTextureSlug(backName);
                } else {
                    motive = motiveRepository.save(frontMotive);
                }

                Card card = cardRepository.findCardByOrderId(name);
                if (card == null) {
                    log.warn("failed to import motive for " + name + " in to the database because the corresponding Card doesn't have an database entry");
                    return "500";
                }
                MotiveMap map = new MotiveMap();
                map.setMotive(motive);
                map.setSide("FRONT");
                map.setCard(card);
                MotiveMap.MotiveMapId mapId = new MotiveMap.MotiveMapId();
                mapId.setMotive(motive.getId());
                mapId.setCard(card.getId());
                map.setMotiveMapId(mapId);
                motiveMapRepository.save(map);
            }
            if (Files.exists(filePathBack)) {
                Motive backMotive = new Motive();
                backMotive.setTextureSlug(backName);

                Motive motive;
                if (motiveRepository.existsMotiveByTextureSlug(frontName)) {
                    motive = motiveRepository.findByTextureSlug(backName);
                } else {
                    motive = motiveRepository.save(backMotive);
                }

                Card card = cardRepository.findCardByOrderId(name);
                if (card == null) {
                    log.warn("failed to import motive for " + name + " in to the database because the corresponding Card doesn't have an database entry");
                    return "500";
                }
                MotiveMap map = new MotiveMap();
                map.setMotive(motive);
                map.setSide("BACK");
                map.setCard(card);
                MotiveMap.MotiveMapId mapId = new MotiveMap.MotiveMapId();
                mapId.setMotive(motive.getId());
                mapId.setCard(card.getId());
                map.setMotiveMapId(mapId);
                motiveMapRepository.save(map);
            }


        } catch (IOException e) {
            log.warn("saving file \"" + name + "\" didn't work");
            return "500";
        }
        return "200";
    }
}
