package de.kettcards.web2print.web;

import de.kettcards.web2print.service.MotiveImportService;
import de.kettcards.web2print.service.XlsxImportService;
import de.kettcards.web2print.storage.Content;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

//@CrossOrigin("*")
@RestController
@RequestMapping("${web2print.links.api-path}/import")
public final class ImportController {

    @Autowired
    private XlsxImportService xlsxImportService;

    @Autowired
    private MotiveImportService motiveImportService;

    @PostMapping("/table")
    public void importTable(@RequestParam("file") MultipartFile file) throws IOException {
        xlsxImportService.importCards(file.getInputStream());
    }

    @PostMapping("/defaultMotive")
    public void importDefaultMotive(@RequestParam("file") MultipartFile file) throws IOException {
        motiveImportService.importDefaultMotive(Content.from(file));
    }

}
