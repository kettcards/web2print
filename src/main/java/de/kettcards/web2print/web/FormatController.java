package de.kettcards.web2print.web;

import de.kettcards.web2print.model.db.CardFormat;
import de.kettcards.web2print.repository.CardFormatRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("${web2print.links.api-path}")
public class FormatController {

    @Autowired
    private CardFormatRepository cardFormatRepository;

    @GetMapping("/aspectRatio")
    public ResponseEntity<Iterable<CardFormat>> getRatio() {
        return ResponseEntity.ok(cardFormatRepository.findAll());
    }

    @GetMapping("/aspectRatio/{id}")
    public ResponseEntity<CardFormat> getRatios(@PathVariable Integer id) {
        return ResponseEntity.ok(cardFormatRepository.findById(id).orElseThrow());
    }

    @PostMapping("/aspectRatio")
    public void addRatio(@RequestBody CardFormat cardFormat) {
        cardFormatRepository.save(cardFormat);
    }

    @DeleteMapping("/aspectRatio/{id}")
    public void removeRatio(@PathVariable Integer id) {
        CardFormat cardFormat = new CardFormat();
        cardFormat.setId(id);
        cardFormatRepository.delete(cardFormat);
    }


}
