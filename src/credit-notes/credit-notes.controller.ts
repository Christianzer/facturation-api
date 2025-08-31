import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreditNotesService } from './credit-notes.service';
import { CreateCreditNoteDto } from './dto/create-credit-note.dto';
import { UpdateCreditNoteDto } from './dto/update-credit-note.dto';
import { UpdateCreditNoteStatusDto } from './dto/update-credit-note-status.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../entities/user.entity';

@ApiTags('Credit Notes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('credit-notes')
export class CreditNotesController {
  constructor(private readonly creditNotesService: CreditNotesService) {}

  @ApiOperation({ summary: 'Create a new credit note' })
  @ApiResponse({ status: 201, description: 'Credit note successfully created' })
  @Post()
  create(
    @Body() createCreditNoteDto: CreateCreditNoteDto,
    @CurrentUser() user: User,
  ) {
    return this.creditNotesService.create(createCreditNoteDto, user);
  }

  @ApiOperation({ summary: 'Get all credit notes for current user' })
  @ApiResponse({
    status: 200,
    description: 'Credit notes retrieved successfully',
  })
  @Get()
  findAll(@CurrentUser() user: User) {
    return this.creditNotesService.findAll(user.id);
  }

  @ApiOperation({ summary: 'Get credit note by ID' })
  @ApiResponse({
    status: 200,
    description: 'Credit note retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Credit note not found' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.creditNotesService.findOne(id);
  }

  @ApiOperation({ summary: 'Update credit note' })
  @ApiResponse({ status: 200, description: 'Credit note updated successfully' })
  @ApiResponse({ status: 404, description: 'Credit note not found' })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCreditNoteDto: UpdateCreditNoteDto,
  ) {
    return this.creditNotesService.update(id, updateCreditNoteDto);
  }

  @ApiOperation({ summary: 'Update credit note status' })
  @ApiResponse({
    status: 200,
    description: 'Credit note status updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Credit note not found' })
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateCreditNoteStatusDto,
  ) {
    return this.creditNotesService.updateStatus(id, updateStatusDto.status);
  }

  @ApiOperation({ summary: 'Delete credit note' })
  @ApiResponse({ status: 200, description: 'Credit note deleted successfully' })
  @ApiResponse({ status: 404, description: 'Credit note not found' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.creditNotesService.remove(id);
  }
}
