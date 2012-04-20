   var objItems = new Object();
   var Favoriter = mainMenu.addTopLevelMenu('Favoriter','Favoriter');
   var Startsida = mainMenu.addTopLevelMenu('Startsida','Startsida');
   var Ekonomiskoversikt = mainMenu.addTopLevelMenu('Ekonomiskoversikt','Ekonomisk &ouml;versikt');
   var BetalaOverfora = mainMenu.addTopLevelMenu('BetalaOverfora','Betala/&Ouml;verf&ouml;ra');
   var SparaPlacera = mainMenu.addTopLevelMenu('SparaPlacera','Spara/Placera');
   var Lana = mainMenu.addTopLevelMenu('Lana','L&aring;na');
   var Forsekra = mainMenu.addTopLevelMenu('Forsekra','F&ouml;rs&auml;kra');
   var Tillvalstjenster = mainMenu.addTopLevelMenu('Tillvalstjenster','Tillval');
    var BetalaOverfora_Oversikt = mainMenu.addMenu('BetalaOverfora_Oversikt');
    var BetalaOverfora_Overforingar = mainMenu.addMenu('BetalaOverfora_Overforingar');
    var Tillvalstjenster_vbvmcsc = mainMenu.addMenu('Tillvalstjenster_vbvmcsc');

   with(Favoriter) {
      url = '../bviPrivat/privat?TDEApplName=TDEApplMeny&_flow_id_=VISA_INNEHALL_CLIENT&_new_flow_=true&menuId=Favoriter';
   }

   with(Startsida) {
      url = '../bviPrivat/privat?TDEApplName=TDEApplMeny&_flow_id_=VISA_INNEHALL_CLIENT&_new_flow_=true&menuId=Startsida';
      objItems['Startsida_Startsida'] = addItem('Startsida','../bviPrivat/privat?TDEApplName=TDEApplEngagemang&_flow_id_=VISA_STARTSIDA_PRE_CLIENT&_new_flow_=true&menuId=Startsida_Startsida');
      objItems['Startsida_Dokument'] = addItem('Elektroniska dokument','../bviPrivat/privat?TDEApplName=#&_flow_id_=#&_new_flow_=true&menuId=Startsida_Dokument');
      objItems['Startsida_Instellningar'] = addItem('Egna inst&auml;llningar','../bviPrivat/privat?TDEApplName=TDEApplDialogeninstellningKund&_flow_id_=INSTELLNING_VISA_OVERSIKT_PRE_CLIENT&_new_flow_=true&menuId=Startsida_Instellningar');
      objItems['Startsida_Bestellningar'] = addItem('Best&auml;ll tj&auml;nster','../bviPrivat/privat?TDEApplName=TDEApplDialogenbestellning&_flow_id_=BESTELLNING_VISA_OVERSIKT_PRE_CLIENT&_new_flow_=true&menuId=Startsida_Bestellningar');
      objItems['Startsida_KontaktaOss'] = addItem('Kontakta oss','../bviPrivat/privat?TDEApplName=TDEApplDialogenmeddelande&_flow_id_=VISA_FRAGA_PRE_CLIENT&_new_flow_=true&menuId=Startsida_KontaktaOss');
   }

   with(Ekonomiskoversikt) {
      url = '../bviPrivat/privat?TDEApplName=TDEApplMeny&_flow_id_=VISA_INNEHALL_CLIENT&_new_flow_=true&menuId=Ekonomiskoversikt';
      objItems['EkonomiskOversikt_KontonLan'] = addItem('Konton och l&aring;n - &ouml;versikt','../bviPrivat/privat?TDEApplName=TDEApplEngagemang&_flow_id_=VISA_EKONOMISK_OVERSIKT_PRE_CLIENT&_new_flow_=true&menuId=EkonomiskOversikt_KontonLan');
      objItems['EkonomiskOversikt_Kort'] = addItem('Kort&ouml;versikt','../bviPrivat/privat?TDEApplName=TDEApplKort&_flow_id_=VISA_KORTOVERSIKT_PRECLIENT&_new_flow_=true&menuId=EkonomiskOversikt_Kort');
      objItems['EkonomiskOversikt_Sortering_Osynlig'] = addItem('','../bviPrivat/privat?TDEApplName=#&_flow_id_=#&_new_flow_=true&menuId=EkonomiskOversikt_Sortering_Osynlig');
   }

   with(BetalaOverfora) {
      url = '../bviPrivat/privat?TDEApplName=TDEApplMeny&_flow_id_=VISA_INNEHALL_CLIENT&_new_flow_=true&menuId=BetalaOverfora';
      objItems['BetalaOverfora_Oversikt'] = addItem('Kontoh&auml;ndelser - &ouml;versikt','../bviPrivat/privat?TDEApplName=TDEApplMeny&_flow_id_=VISA_INNEHALL_CLIENT&_new_flow_=true&menuId=BetalaOverfora_Oversikt',BetalaOverfora_Oversikt);
      objItems['BetalaOverfora_Anmelan'] = addItem('Best&auml;ll tj&auml;nsten Internetbetalning','../bviPrivat/privat?TDEApplName=TDEApplBetalning&_flow_id_=BESTELL_INTERNETBETALNING_INFO_CLIENT&_new_flow_=true&menuId=BetalaOverfora_Anmelan');
      objItems['BetalaOverfora_BetalaRekning'] = addItem('Bg/Pg-betalningar','../bviPrivat/privat?TDEApplName=#&_flow_id_=#&_new_flow_=true&menuId=BetalaOverfora_BetalaRekning');
      objItems['BetalaOverfora_Autogiro'] = addItem('Autogiro','../bviPrivat/privat?TDEApplName=TDEApplAutogiro&_flow_id_=VISA_OVERSIKT_AUTOGIRO_MEDGIVANDE_PRE_CLIENT&_new_flow_=true&menuId=BetalaOverfora_Autogiro');
      objItems['BetalaOverfora_Efaktura'] = addItem('E-faktura','../bviPrivat/privat?TDEApplName=TDEApplEfaktura&_flow_id_=EFAKTURA_VISA_ANMELAN_OVERSIKT_PRE_CLIENT&_new_flow_=true&menuId=BetalaOverfora_Efaktura');
      objItems['BetalaOverfora_Overforingar'] = addItem('&Ouml;verf&ouml;ringar','../bviPrivat/privat?TDEApplName=TDEApplMeny&_flow_id_=VISA_INNEHALL_CLIENT&_new_flow_=true&menuId=BetalaOverfora_Overforingar',BetalaOverfora_Overforingar);
      objItems['BetalaOverfora_BetalaUtland'] = addItem('Internationella betalningar','../bviPrivat/privat?TDEApplName=TDEApplUtlandsbetalning&_flow_id_=SETT_PRODUKTDEL_BASTJENST_PRECLIENT&_new_flow_=true&menuId=BetalaOverfora_BetalaUtland');
      objItems['BetalaOverfora_Mottagarlistor'] = addItem('Mottagarlistor','../bviPrivat/privat?TDEApplName=#&_flow_id_=#&_new_flow_=true&menuId=BetalaOverfora_Mottagarlistor');
      objItems['BetalaOverfora_Kontantkortsladdning'] = addItem('Ladda kontantkort','../bviPrivat/privat?TDEApplName=TDEApplKontantkortsladdning&_flow_id_=LADDA_KONTANTKORT_REGISTRERA_PRE_CLIENT&_new_flow_=true&menuId=BetalaOverfora_Kontantkortsladdning');
      objItems['BetalaOverfora_Kontantkortsladdning_Anslut'] = addItem('Ladda kontantkort','../bviPrivat/privat?TDEApplName=TDEApplKontantkortsladdning&_flow_id_=LADDA_KONTANTKORT_ANSLUT_PRE_CLIENT&_new_flow_=true&menuId=BetalaOverfora_Kontantkortsladdning_Anslut');
   }

   with(SparaPlacera) {
      url = '../bviPrivat/privat?TDEApplName=TDEApplMeny&_flow_id_=VISA_INNEHALL_CLIENT&_new_flow_=true&menuId=SparaPlacera';
      objItems['SparaPlacera_Oversikt'] = addItem('Sparande - &ouml;versikt','../bviPrivat/privat?TDEApplName=TDEApplSparaoversikt&_flow_id_=VISA_SPARA_INNEHAV_PRE_CLIENT&_new_flow_=true&menuId=SparaPlacera_Oversikt');
      objItems['SparaPlacera_Pension'] = addItem('Pensionssparande - &ouml;versikt','../bviPrivat/privat?TDEApplName=TDEApplPensionsspar&_flow_id_=VISA_OVERSIKT_PRE_CLIENT&_new_flow_=true&menuId=SparaPlacera_Pension');
      objItems['SparaPlacera_Pension_PPM_EPF'] = addItem('Premiepension Internetbanken','../bviPrivat/privat?TDEApplName=TDEApplPPM&_flow_id_=EPF_OVERSIKT_BEFINTLIGTINNEHAV_PRE_CLIENT&_new_flow_=true&menuId=SparaPlacera_Pension_PPM_EPF');
      objItems['SparaPlacera_Pension_PPM_DPF'] = addItem('Premiepension F&ouml;rvaltning','../bviPrivat/privat?TDEApplName=TDEApplPPM&_flow_id_=DPF_OVERSIKT_PRE_CLIENT&_new_flow_=true&menuId=SparaPlacera_Pension_PPM_DPF');
      objItems['SparaPlacera_Fondkonto'] = addItem('&Ouml;ppna fondkonto','../bviPrivat/privat?TDEApplName=TDEApplFondspar&_flow_id_=BESTELL_FONDKONTO_PRE_CLIENT&_new_flow_=true&menuId=SparaPlacera_Fondkonto');
      objItems['SparaPlacera_Fonder'] = addItem('Fonder','../bviPrivat/privat?TDEApplName=TDEApplFondspar&_flow_id_=VISA_INNEHAV_PERKONTONUMMER_PRE_CLIENT&_new_flow_=true&menuId=SparaPlacera_Fonder');
      objItems['SparaPlacera_ISK'] = addItem('Investeringssparkonto','../bviPrivat/privat?TDEApplName=TDEApplPortfolioInvestment&_flow_id_=ISK_SHOW_HOLDINGS_PRECLIENT&_new_flow_=true&menuId=SparaPlacera_ISK');
      objItems['SparaPlacera_ISK_Oppna'] = addItem('&Ouml;ppna Investeringssparkonto','../bviPrivat/privat?TDEApplName=TDEApplCLNLIntegration&_flow_id_=CLNL_CALL_REDIRECT&_nlportlet_id_=/TDE_DAP_Portal_BvIPrivat_WEB/portal/investment/createisk?_new_flow_=true');
      objItems['SparaPlacera_KapitalForsekringar_Ny'] = addItem('Best&auml;ll kapitalf&ouml;rs&auml;kring','../bviPrivat/privat?TDEApplName=TDEApplKapitalforsekring&_flow_id_=KAPITALFORSEKRING_BESTELLNING_STEG1_SERVER&_new_flow_=true&menuId=SparaPlacera_KapitalForsekringar_Ny');
      objItems['SparaPlacera_Kapitalforsekringar'] = addItem('Kapitalf&ouml;rs&auml;kringar','../bviPrivat/privat?TDEApplName=TDEApplKapitalforsekring&_flow_id_=KAPITALFORSEKRING_VISA_INNEHAV_PRE_CLIENT&_new_flow_=true&menuId=SparaPlacera_Kapitalforsekringar');
      objItems['SparaPlacera_AnmelVerdepapper'] = addItem('&Ouml;ppna ny v&auml;rdepapperstj&auml;nst','javascript:fsbOppnaFonster("../bviPrivat/privat?TDEApplName=TDEApplEngagemang&_flow_id_=SKICKA_DATA_TILL_NETTRADE_CLIENT&ai_TDEApplName=TDEApplVpAnmelan&ai_flow_id_=ANMELAN_TJENSTSTATUS_PRE_CLIENT&doNotRunPaketeringsnavigator=true&OldWindowSessId=", "NetTrade", 1012, 640, "scrollbars=yes,resizable=yes,status=yes,menubar=yes,directories=yes,toolbar=yes,location=yes");');
      objItems['SparaPlacera_Verdepapper'] = addItem('V&auml;rdepapperstj&auml;nsten','javascript:fsbOppnaFonster("../bviPrivat/privat?TDEApplName=TDEApplEngagemang&_flow_id_=SKICKA_DATA_TILL_NETTRADE_CLIENT&ai_TDEApplName=TDEApplVpHandel&ai_flow_id_=VISA_INNEHAV_PRE_CLIENT&doNotRunPaketeringsnavigator=true&Nomeny=true&OldWindowSessId=", "NetTrade", 1012, 640, "scrollbars=yes,resizable=yes,status=yes,menubar=yes,directories=yes,toolbar=yes,location=yes");');
      objItems['SparaPlacera_Sparkonto'] = addItem('&Ouml;ppna sparkonto','../bviPrivat/privat?TDEApplName=TDEApplInlanKontoAdm&_flow_id_=OPPNA_NYTT_KONTO_PRE_CLIENT_1&_new_flow_=true&menuId=SparaPlacera_Sparkonto');
      objItems['SparaPlacera_Spax'] = addItem('Anm&auml;l k&ouml;p av SPAX','../bviPrivat/privat?TDEApplName=TDEApplVPEmission&_flow_id_=BESTELL_VPEMISSION_STEG1_PRE_CLIENT&_new_flow_=true&menuId=SparaPlacera_Spax');
   }

   with(Lana) {
      url = '../bviPrivat/privat?TDEApplName=TDEApplMeny&_flow_id_=VISA_INNEHALL_CLIENT&_new_flow_=true&menuId=Lana';
      objItems['Lana_Oversikt'] = addItem('L&aring;ne&ouml;versikt','../bviPrivat/privat?TDEApplName=TDEApplKreditinformation&_flow_id_=VISA_OVERSIKT_LAN_PRE_CLIENT&_new_flow_=true&menuId=Lana_Oversikt');
      objItems['Lana_NyttLan'] = addItem('Ans&ouml;kan om l&aring;n och l&aring;nel&ouml;fte','../bviPrivat/privat?TDEApplName=TDEApplKreditforfragan&_flow_id_=KREDITPRODUKT_OVERSIKT_PRE_CLIENT&_new_flow_=true&menuId=Lana_NyttLan');
   }

   with(Forsekra) {
      url = '../bviPrivat/privat?TDEApplName=TDEApplMeny&_flow_id_=VISA_INNEHALL_CLIENT&_new_flow_=true&menuId=Forsekra';
      objItems['Forsekring_Oversikt'] = addItem('F&ouml;rs&auml;krings&ouml;versikt','../bviPrivat/privat?TDEApplName=TDEApplSafetyInsuranceOverview&_flow_id_=VIEW_SAFETYINSURANCE_CURRENT_PRECLIENT&_new_flow_=true&menuId=Forsekring_Oversikt');
      objItems['Forsekring_Ny'] = addItem('Ny f&ouml;rs&auml;kring/f&ouml;rs&auml;kringsf&ouml;rslag','../bviPrivat/privat?TDEApplName=TDEApplSakforsekring&_flow_id_=VELJ_FORSEKRING_PRE_CLIENT&_new_flow_=true&menuId=Forsekring_Ny');
      objItems['SafetyInsurance_Insurance_New'] = addItem('Ny personf&ouml;rs&auml;kring','../bviPrivat/privat?TDEApplName=TDEApplSafetyInsuranceOverview&_flow_id_=VIEW_PRODUCT_SELECTION_PRECLIENT&_new_flow_=true&menuId=SafetyInsurance_Insurance_New');
   }

   with(Tillvalstjenster) {
      url = '../bviPrivat/privat?TDEApplName=TDEApplMeny&_flow_id_=VISA_INNEHALL_CLIENT&_new_flow_=true&menuId=Tillvalstjenster';
      objItems['Tillvalstjenster_BankernasId'] = addItem('BankID','../bviPrivat/privat?TDEApplName=TDEApplMeny&_flow_id_=VISA_INNEHALL_CLIENT&_new_flow_=true&menuId=Tillvalstjenster_BankernasId');
      objItems['Tillvalstjenster_BestellTelefonbanken'] = addItem('Telefonbanken','../bviPrivat/privat?TDEApplName=#&_flow_id_=#&_new_flow_=true&menuId=Tillvalstjenster_BestellTelefonbanken');
      objItems['Tillvalstjenster_ByteTillFtgAvtal'] = addItem('Internetbanken f&ouml;r f&ouml;retagare','../bviPrivat/privat?TDEApplName=TDEApplIBAvtalAdm&_flow_id_=BYTE_TILL_FTG_AVTAL_PRE_CLIENT&_new_flow_=true&menuId=Tillvalstjenster_ByteTillFtgAvtal');
      objItems['Tillvalstjenster_BestellKod'] = addItem('Best&auml;ll personlig kod','../bviPrivat/privat?TDEApplName=TDEApplPersonligKod&_flow_id_=GODKENN_AVTAL_PRE_CLIENT&_new_flow_=true&menuId=Tillvalstjenster_BestellKod');
      objItems['Tillvalstjenster_BytKod'] = addItem('Byt personlig kod','../bviPrivat/privat?TDEApplName=TDEApplPersonligKod&_flow_id_=BYT_PKOD_PRE_CLIENT&_new_flow_=true&menuId=Tillvalstjenster_BytKod');
      objItems['Tillvalstjenster_Mobilbanken'] = addItem('Mobilbanken','../bviPrivat/privat?TDEApplName=TDEApplWAP&_flow_id_=VISA_MOBIL_INFO_SERVER&_new_flow_=true&menuId=Tillvalstjenster_Mobilbanken');
      objItems['Tillvalstjenster_vbvmcsc'] = addItem('Anslut/byt l&ouml;senord/administrera kort till Verified by Visa / MasterCard SecureCode','../bviPrivat/privat?TDEApplName=TDEApplMeny&_flow_id_=VISA_INNEHALL_CLIENT&_new_flow_=true&menuId=Tillvalstjenster_vbvmcsc',Tillvalstjenster_vbvmcsc);
      objItems['Tillvalstjenster_Bevakaerenden'] = addItem('Bevaka &auml;renden','../bviPrivat/privat?TDEApplName=#&_flow_id_=#&_new_flow_=true&menuId=Tillvalstjenster_Bevakaerenden');
   }

   with(BetalaOverfora_Oversikt) {
      url = '../bviPrivat/privat?TDEApplName=TDEApplMeny&_flow_id_=VISA_INNEHALL_CLIENT&_new_flow_=true&menuId=BetalaOverfora_Oversikt';
      objItems['BetalaOverfora_Oversikt_Aktuella'] = addItem('Aktuella kontoh&auml;ndelser','../bviPrivat/privat?TDEApplName=#&_flow_id_=#&_new_flow_=true&menuId=BetalaOverfora_Oversikt_Aktuella');
      objItems['BetalaOverfora_Oversikt_Historiska'] = addItem('Historiska kontoh&auml;ndelser','../bviPrivat/privat?TDEApplName=#&_flow_id_=#&_new_flow_=true&menuId=BetalaOverfora_Oversikt_Historiska');
      objItems['BetalaOverfora_Oversikt_Avvisade'] = addItem('Avvisade kontoh&auml;ndelser','../bviPrivat/privat?TDEApplName=#&_flow_id_=#&_new_flow_=true&menuId=BetalaOverfora_Oversikt_Avvisade');
   }

   with(BetalaOverfora_Overforingar) {
      url = '../bviPrivat/privat?TDEApplName=TDEApplMeny&_flow_id_=VISA_INNEHALL_CLIENT&_new_flow_=true&menuId=BetalaOverfora_Overforingar';
      objItems['BetalaOverfora_Overforingar_OverforKonto'] = addItem('&Ouml;verf&ouml;ringar konton','../bviPrivat/privat?TDEApplName=TDEApplOverforing&_flow_id_=OVERFORA_REGISTRERINGSUPPGIFTER_PRE_CLIENT&_new_flow_=true&menuId=BetalaOverfora_Overforingar_OverforKonto');
      objItems['BetalaOverfora_Overforingar_OverforEgnaPg'] = addItem('&Ouml;verf&ouml;ringar fr&aring;n egna pg-konton','../bviPrivat/privat?TDEApplName=TDEApplPgOverforing&_flow_id_=PGOVERFORA_REGISTRERINGSUPPGIFTER_PRE_CLIENT&_new_flow_=true&menuId=BetalaOverfora_Overforingar_OverforEgnaPg');
   }

   with(Tillvalstjenster_vbvmcsc) {
      url = '../bviPrivat/privat?TDEApplName=TDEApplMeny&_flow_id_=VISA_INNEHALL_CLIENT&_new_flow_=true&menuId=Tillvalstjenster_vbvmcsc';
      objItems['Kort_VBVMCSC_Administrera'] = addItem('Administrera','../bviPrivat/privat?TDEApplName=TDEApplKort&_flow_id_=ANSLUT_VBVMCSC_STEG1_PRECLIENT&_new_flow_=true&menuId=Kort_VBVMCSC_Administrera');
      objItems['Kort_VBVMCSC_Avsluta'] = addItem('Avsluta tj&auml;nst','../bviPrivat/privat?TDEApplName=TDEApplKort&_flow_id_=AVSLUTA_VBVMCSC_STEG1_PRECLIENT&_new_flow_=true&menuId=Kort_VBVMCSC_Avsluta');
   }

