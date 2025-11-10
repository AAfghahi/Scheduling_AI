package prerna;

import prerna.reactor.AbstractReactor;
import prerna.sablecc2.om.PixelDataType;
import prerna.sablecc2.om.ReactorKeysEnum;
import prerna.sablecc2.om.nounmeta.NounMetadata;
import prerna.util.Constants;

import java.io.File;
import java.io.FileInputStream;
import java.util.UUID;

import java.io.IOException;
import java.util.List;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

public class UploadScheduleReactor extends AbstractReactor {

  public UploadScheduleReactor() {
    this.keysToGet = new String[] { "FILE_PATH" };
    this.keyRequired = new int[] { 1 };
  }

  public static Map<String, String> holidayKeys = new HashMap<String, String>() {
    {
      put("F", "First Day of School");
      put("L", "Last Day of School");
      put("H", "Holidays");
      put("SH", "Student Holiday");
    }
  };

  @Override
  public NounMetadata execute() {

    organizeKeys();
    String filePath = (String) this.keyValue.get("FILE_PATH");
    List<String> result = new ArrayList<>();
    LocalDate firstDay = null;
    LocalDate lastDay = null;

    try {
      String absolutePath = this.insight.getAbsoluteInsightFolderPath(filePath);
      File file = new File(absolutePath);
      FileInputStream fis = new FileInputStream(file);
      Workbook workbook = new XSSFWorkbook(fis);

      for (int i = 1; i < workbook.getNumberOfSheets(); i++) {
        Sheet sheet = workbook.getSheetAt(i);

        Iterator<Row> rowIterator = sheet.iterator();
        while (rowIterator.hasNext()) {
          Row row = rowIterator.next();
          int currentRowIndex = row.getRowNum();

          if (currentRowIndex < 4) { // skip header rows
            continue;
          }

          Iterator<Cell> cellIterator = row.cellIterator();
          while (cellIterator.hasNext()) {
            Cell dateCell = cellIterator.next();
            if (dateCell != null && dateCell.getCellType() != CellType.BLANK) {
              int cellIndex = dateCell.getColumnIndex();
              Row nextRow = sheet.getRow(currentRowIndex + 1);
              if (nextRow != null) {
                Cell nextRowCell = nextRow.getCell(cellIndex);

                if (nextRowCell != null &&
                    nextRowCell.getCellType() == CellType.STRING &&
                    holidayKeys.containsKey(nextRowCell.getStringCellValue().trim())) {
                  result.add(dateCell.getDateCellValue().toInstant()
                      .atZone(java.time.ZoneId.systemDefault())
                      .toLocalDate().toString());

                  if (nextRowCell.getStringCellValue().trim().equals("L")) {
                    lastDay = dateCell.getDateCellValue().toInstant()
                        .atZone(java.time.ZoneId.systemDefault())
                        .toLocalDate();
                  } else if (nextRowCell.getStringCellValue().trim().equals("F")) {
                    firstDay = dateCell.getDateCellValue().toInstant()
                        .atZone(java.time.ZoneId.systemDefault())
                        .toLocalDate();
                  }

                  // get days between last and first day
                  // if (firstDay != null && lastDay != null) {

                  // }
                }
              }
            }
          }
        }
      }

      workbook.close();
      fis.close();
      System.out.println("result dates:");
      for (LocalDate date : result) {
        System.out.println("  " + date);
      }
    } catch (Exception e) {
      e.printStackTrace();
    }

    return new NounMetadata(result, PixelDataType.CUSTOM_DATA_STRUCTURE);

  }
}
