package de.kettcards.web2print.web;

import de.kettcards.web2print.model.db.Card;
import de.kettcards.web2print.model.db.Motive;
import de.kettcards.web2print.model.tableimport.request.MotiveRequest;
import de.kettcards.web2print.model.tableimport.request.MotiveResponse;
import de.kettcards.web2print.repository.MotiveRepository;
import de.kettcards.web2print.service.MotiveScaleService;
import de.kettcards.web2print.service.StorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("${web2print.links.api-path}/motive")
public class MotiveController {

    @Autowired
    private StorageService storageService;

    @Autowired
    private MotiveRepository motiveRepository;

    @Autowired
    private MotiveScaleService motiveScaleService;

    //TODO move that somewhere else
    private Path baseDir;

    @PostConstruct
    public void init() throws IOException {
        baseDir = Files.createTempDirectory("w2p_motives_raw");
    }

    @GetMapping
    public ResponseEntity<byte[]> getMotive(@RequestBody String motiveRequest) { //name of the image, motive files should be served static
        Path path = baseDir.resolve(motiveRequest);
        try {
            return ResponseEntity.ok(Files.readAllBytes(path));
        } catch (IOException ex) {
            return ResponseEntity.badRequest().build();
        }
    }

}
