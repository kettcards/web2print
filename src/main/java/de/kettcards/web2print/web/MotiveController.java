package de.kettcards.web2print.web;

import de.kettcards.web2print.service.MotiveImportService;
import de.kettcards.web2print.storage.Content;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Deprecated
@RestController
@RequestMapping("${web2print.links.api-path}")
public class MotiveController {

    @Autowired
    private MotiveImportService motiveImportService;

    @PostMapping("/defaultMotive")
    public ResponseEntity<String> saveStandardMotive(@RequestParam("file") MultipartFile file) throws IOException {
        motiveImportService.importDefaultMotive(Content.from(file));
        return ResponseEntity.ok("");
    }


    /*

    @GetMapping
    public ResponseEntity<byte[]> getMotive(@RequestBody String motiveRequest) { //name of the image, motive files should be served static
        Path path = baseDir.resolve(motiveRequest);
        try {
            return ResponseEntity.ok(Files.readAllBytes(path));
        } catch (IOException ex) {
            return ResponseEntity.badRequest().build();
        }
    }

     */

}
