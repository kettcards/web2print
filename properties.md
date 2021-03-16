#Einstellungen
Vor dem Programmstart können folgende Einstellungen festgelegt werden:

##Allgemeines

 ``web2print.links.base-path=/web2print/``
> der Pfad relativ zu der Domain

 ``web2print.editor.max-file-size=5MB``
> die maximale Dateigröße welche hochgeladen werden darf

##Speicher ```storage```

```web2print.storage.base-dir=data/```
> das Verzeichnis welches alle Nutzdaten enthält



```web2print.storage.expired-check=* * * * * *```
> wann eine Säuberung von Dateien welche ein Ablaufdatum haben ausgeführt werden soll. Das Format ist hierbei ähnlich wie bei einem [cron-job](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/scheduling/support/CronSequenceGenerator.html)

 ```web2print.storage.user-content=14d```
> nach welchem Zeitraum Nutzerdesigns/Bilder von Nutzer hochgeladen werden
* s for seconds
* m for minutes
* h for hours
* d for days


