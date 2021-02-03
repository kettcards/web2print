package de.kettcards.web2print.web;

import de.kettcards.web2print.service.LayoutStorageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.text.ParseException;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("${web2print.links.api-path}")
public class SaveController {

    @Autowired
    private LayoutStorageService storageService;

    @PostMapping(value = {"/save/", "/save/{storageId}"})
    public void save(@PathVariable(required = false) String storageId,
                     @RequestParam String export,
                     @RequestParam("data") String cardData)
            throws IOException, ParseException {
        storageService.StoreCard(storageId, cardData);
        if (export.equals("true"))
            storageService.ExportCard(cardData);
    }


    @GetMapping(value = {"/pdfs"})
    public List<String> list() throws IOException, ParseException {
        return storageService.list();
    }

    @GetMapping(value = {"/pdfs/{storageId}"}, produces = "application/pdf")
    public Resource load(@PathVariable(required = false) String storageId) throws IOException, ParseException {
        return storageService.load(storageId);
    }
}
